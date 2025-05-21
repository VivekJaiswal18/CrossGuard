use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use pyth_sdk_solana::load_price_feed_from_account_info;

declare_id!("BWBZAQvr5i6JPs23sDUzqEVYNC3BqujUEkgnNkpB5Rgn");

#[program]
pub mod crossguard {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.owner = ctx.accounts.owner.key();
        state.pyth_price_feed = ctx.accounts.pyth_price_feed.key();
        Ok(())
    }

    pub fn create_intent(
        ctx: Context<CreateIntent>,
        intent_id: u64,
        source_amount: u64,
        target_amount: u64,
        trigger_price: i64,
        is_take_profit: bool,
        target_chain: [u8; 4],
        target_action: [u8; 4],
        loop_mode: bool,
        loop_count: u64,
    ) -> Result<()> {
        require!(source_amount > 0, CrossGuardError::InvalidAmount);
        require!(target_amount > 0, CrossGuardError::InvalidAmount);
        require!(trigger_price > 0, CrossGuardError::InvalidPrice);
        require!(loop_count <= 2, CrossGuardError::LoopCountTooHigh);

        // Transfer tokens from user to intent account
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.intent_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            source_amount,
        )?;

        // Initialize intent fields
        let intent = &mut ctx.accounts.intent;
        intent.intent_id = intent_id;
        intent.user = ctx.accounts.user.key();
        intent.source_token = ctx.accounts.source_token.key();
        intent.target_token = ctx.accounts.target_token.key();
        intent.source_amount = source_amount;
        intent.target_amount = target_amount;
        intent.trigger_price = trigger_price;
        intent.is_take_profit = is_take_profit;
        intent.is_active = true;
        intent.created_at = Clock::get()?.unix_timestamp;
        intent.executed_at = 0;
        intent.target_chain = target_chain;
        intent.target_action = target_action;
        intent.loop_mode = loop_mode;
        intent.loop_count = loop_count;

        // Emit events in smaller chunks to reduce stack usage
        emit!(IntentCreatedBasicInfo {
            intent_id: intent.key(),
            user: intent.user,
            source_amount,
            trigger_price,
            is_take_profit,
            loop_mode,
            loop_count,
        });
        emit!(IntentCreatedTokenInfo {
            intent_id: intent.key(),
            source_token: intent.source_token,
            target_token: intent.target_token,
        });
        emit!(IntentCreatedActionInfo {
            intent_id: intent.key(),
            target_chain,
            target_action,
        });

        Ok(())
    }

    pub fn execute_intent(ctx: Context<ExecuteIntent>) -> Result<()> {
        // Get all immutable data first to avoid borrow checker issues
        let intent_id = ctx.accounts.intent.key();
        let user = ctx.accounts.intent.user;
        let source_amount = ctx.accounts.intent.source_amount;
        let loop_mode = ctx.accounts.intent.loop_mode;
        let loop_count = ctx.accounts.intent.loop_count;
        let intent_user = ctx.accounts.intent.user;
        let intent_id_val = ctx.accounts.intent.intent_id;
        let intent_bump = *ctx.bumps.get("intent").unwrap();
        let intent_seeds = &[b"intent", intent_user.as_ref(), &intent_id_val.to_le_bytes(), &[intent_bump]];

        let price_feed = load_price_feed_from_account_info(&ctx.accounts.pyth_price_feed)
            .map_err(|_| CrossGuardError::InvalidPrice)?;
        let clock = Clock::get()?;
        let price = price_feed
            .get_price_no_older_than(clock.unix_timestamp, 60)
            .ok_or(CrossGuardError::StalePriceFeed)?;

        let is_take_profit = ctx.accounts.intent.is_take_profit;
        let trigger_price = ctx.accounts.intent.trigger_price;
        let condition_met = if is_take_profit {
            price.price >= trigger_price
        } else {
            price.price <= trigger_price
        };
        require!(condition_met, CrossGuardError::PriceConditionNotMet);

        let intent = &mut ctx.accounts.intent;
        require!(intent.is_active, CrossGuardError::IntentNotActive);

        if loop_mode {
            // Optionally decrement loop_count if not infinite
            if loop_count > 0 {
                intent.loop_count -= 1;
                if intent.loop_count == 0 {
                    intent.is_active = false;
                }
            }
            // Transfer to vault
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.intent_token_account.to_account_info(),
                        to: ctx.accounts.vault_token_account.to_account_info(),
                        authority: intent.to_account_info(),
                    },
                    &[intent_seeds],
                ),
                source_amount,
            )?;
            // Optionally emit a Loop event
            emit!(IntentLooped {
                intent_id,
                user,
                loop_count: intent.loop_count,
            });
        } else {
            intent.is_active = false;
            intent.executed_at = clock.unix_timestamp;
            // Transfer to user
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.intent_token_account.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: intent.to_account_info(),
                    },
                    &[intent_seeds],
                ),
                source_amount,
            )?;
            emit!(IntentExecuted {
                intent_id,
                user,
                executed_at: clock.unix_timestamp,
            });
        }
        Ok(())
    }

    pub fn cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
        // Get all immutable data first to avoid borrow checker issues
        let intent_id = ctx.accounts.intent.key();
        let user = ctx.accounts.intent.user;
        let source_amount = ctx.accounts.intent.source_amount;
        let loop_mode = ctx.accounts.intent.loop_mode;
        let intent_user = ctx.accounts.intent.user;
        let intent_id_val = ctx.accounts.intent.intent_id;
        let intent_bump = *ctx.bumps.get("intent").unwrap();
        let intent_seeds = &[b"intent", intent_user.as_ref(), &intent_id_val.to_le_bytes(), &[intent_bump]];

        let intent = &mut ctx.accounts.intent;
        require!(intent.is_active, CrossGuardError::IntentNotActive);
        require!(intent.user == ctx.accounts.user.key(), CrossGuardError::Unauthorized);

        intent.is_active = false;

        if loop_mode {
            // Transfer all tokens from vault to user
            let vault_balance = ctx.accounts.vault_token_account.amount;
            if vault_balance > 0 {
                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.vault_token_account.to_account_info(),
                            to: ctx.accounts.user_token_account.to_account_info(),
                            authority: intent.to_account_info(),
                        },
                        &[intent_seeds],
                    ),
                    vault_balance,
                )?;
            }
        } else {
            // Transfer from intent_token_account as before
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.intent_token_account.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: intent.to_account_info(),
                    },
                    &[intent_seeds],
                ),
                source_amount,
            )?;
        }

        emit!(IntentCancelled {
            intent_id,
            user,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + State::LEN,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Pyth price feed
    pub pyth_price_feed: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(intent_id: u64)]
pub struct CreateIntent<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Intent::LEN,
        seeds = [b"intent", user.key().as_ref(), &intent_id.to_le_bytes()],
        bump
    )]
    pub intent: Account<'info, Intent>,
    #[account(
        mut,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub source_token: Account<'info, Mint>,
    pub target_token: Account<'info, Mint>,
    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == source_token.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = user,
        token::mint = source_token,
        token::authority = intent,
        seeds = [b"intent_token", user.key().as_ref(), &intent_id.to_le_bytes()],
        bump
    )]
    pub intent_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = user,
        token::mint = source_token,
        token::authority = intent,
        seeds = [b"vault", intent.key().as_ref(), &intent_id.to_le_bytes()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExecuteIntent<'info> {
    #[account(mut, seeds = [b"intent", intent.user.as_ref(), &intent.intent_id.to_le_bytes()], bump, close = user)]
    pub intent: Account<'info, Intent>,
    #[account(mut)]
    pub state: Account<'info, State>,
    /// CHECK: verified via pyth SDK
    pub pyth_price_feed: AccountInfo<'info>,
    #[account(mut, close = user, seeds = [b"intent_token", intent.user.as_ref(), &intent.intent_id.to_le_bytes()], bump)]
    pub intent_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut, close = user, seeds = [b"vault", intent.key().as_ref(), &intent.intent_id.to_le_bytes()], bump)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelIntent<'info> {
    #[account(mut, seeds = [b"intent", intent.user.as_ref(), &intent.intent_id.to_le_bytes()], bump, close = user)]
    pub intent: Account<'info, Intent>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, close = user, seeds = [b"intent_token", intent.user.as_ref(), &intent.intent_id.to_le_bytes()], bump)]
    pub intent_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut, close = user, seeds = [b"vault", intent.key().as_ref(), &intent.intent_id.to_le_bytes()], bump)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct State {
    pub owner: Pubkey,
    pub pyth_price_feed: Pubkey,
}
impl State {
    pub const LEN: usize = 32 + 32;
}

#[account]
pub struct Intent {
    pub intent_id: u64,
    pub user: Pubkey,
    pub source_token: Pubkey,
    pub target_token: Pubkey,
    pub source_amount: u64,
    pub target_amount: u64,
    pub trigger_price: i64,
    pub is_take_profit: bool,
    pub is_active: bool,
    pub created_at: i64,
    pub executed_at: i64,
    pub target_chain: [u8; 4],
    pub target_action: [u8; 4],
    pub loop_mode: bool,
    pub loop_count: u64,
}
impl Intent {
    pub const LEN: usize = 8 + 32*3 + 8*4 + 1*2 + 8*2 + 4 + 4 + 1 + 8;
}

// Split the IntentCreated event into smaller events to reduce stack usage
#[event]
pub struct IntentCreatedBasicInfo {
    pub intent_id: Pubkey,
    pub user: Pubkey,
    pub source_amount: u64,
    pub trigger_price: i64,
    pub is_take_profit: bool,
    pub loop_mode: bool,
    pub loop_count: u64,
}

#[event]
pub struct IntentCreatedTokenInfo {
    pub intent_id: Pubkey,
    pub source_token: Pubkey,
    pub target_token: Pubkey,
}

#[event]
pub struct IntentCreatedActionInfo {
    pub intent_id: Pubkey,
    pub target_chain: [u8; 4],
    pub target_action: [u8; 4],
}

#[event]
pub struct IntentLooped {
    pub intent_id: Pubkey,
    pub user: Pubkey,
    pub loop_count: u64,
}

#[event]
pub struct IntentExecuted {
    pub intent_id: Pubkey,
    pub user: Pubkey,
    pub executed_at: i64,
}

#[event]
pub struct IntentCancelled {
    pub intent_id: Pubkey,
    pub user: Pubkey,
}

#[error_code]
pub enum CrossGuardError {
    #[msg("Intent is not active")]
    IntentNotActive,
    #[msg("Price condition not met")]
    PriceConditionNotMet,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Stale price feed")]
    StalePriceFeed,
    #[msg("Invalid target chain")]
    InvalidTargetChain,
    #[msg("Invalid target action")]
    InvalidTargetAction,
    #[msg("Not in loop mode")]
    NotInLoopMode,
    #[msg("Loop count too high")]
    LoopCountTooHigh,
}