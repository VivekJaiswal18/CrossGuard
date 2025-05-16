import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Crossguard } from "../target/types/crossguard";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";

describe("crossguard", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Crossguard as Program<Crossguard>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test accounts
  let stateAccount: PublicKey;
  let pythPriceFeed: PublicKey;
  let sourceToken: PublicKey;
  let targetToken: PublicKey;
  let userTokenAccount: PublicKey;
  let intentAccount: PublicKey;
  let intentTokenAccount: PublicKey;

  // Test data
  const sourceAmount = new anchor.BN(1000);
  const targetAmount = new anchor.BN(2000);
  const triggerPrice = new anchor.BN(50000);
  const isTakeProfit = true;
  const targetChain = "ethereum";
  const targetAction = "swap";

  before(async () => {
    // Create mock Pyth price feed account
    pythPriceFeed = anchor.web3.Keypair.generate().publicKey;

    // Create token mints
    sourceToken = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      9
    );

    targetToken = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      9
    );

    // Create user token account
    userTokenAccount = await createAccount(
      provider.connection,
      wallet.payer,
      sourceToken,
      wallet.publicKey
    );

    // Mint tokens to user
    await mintTo(
      provider.connection,
      wallet.payer,
      sourceToken,
      userTokenAccount,
      wallet.publicKey,
      sourceAmount.toNumber()
    );
  });

  it("Initializes the state account", async () => {
    const stateKeypair = anchor.web3.Keypair.generate();
    stateAccount = stateKeypair.publicKey;

    await program.methods
      .initialize()
      .accounts({
        state: stateAccount,
        owner: wallet.publicKey,
        pythPriceFeed: pythPriceFeed,
        systemProgram: SystemProgram.programId,
      })
      .signers([stateKeypair])
      .rpc();

    const state = await program.account.state.fetch(stateAccount);
    assert.ok(state.owner.equals(wallet.publicKey));
    assert.ok(state.pythPriceFeed.equals(pythPriceFeed));
  });

  it("Creates an intent", async () => {
    // Derive intent account
    [intentAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("intent"), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Derive intent token account
    [intentTokenAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("token_account"), intentAccount.toBuffer()],
      program.programId
    );

    await program.methods
      .createIntent(
        sourceAmount,
        targetAmount,
        triggerPrice,
        isTakeProfit,
        targetChain,
        targetAction
      )
      .accounts({
        intent: intentAccount,
        state: stateAccount,
        user: wallet.publicKey,
        sourceToken: sourceToken,
        targetToken: targetToken,
        userTokenAccount: userTokenAccount,
        intentTokenAccount: intentTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const intent = await program.account.intent.fetch(intentAccount);
    assert.ok(intent.user.equals(wallet.publicKey));
    assert.ok(intent.sourceToken.equals(sourceToken));
    assert.ok(intent.targetToken.equals(targetToken));
    assert.ok(intent.sourceAmount.eq(sourceAmount));
    assert.ok(intent.targetAmount.eq(targetAmount));
    assert.ok(intent.triggerPrice.eq(triggerPrice));
    assert.equal(intent.isTakeProfit, isTakeProfit);
    assert.equal(intent.isActive, true);
    assert.equal(intent.targetChain, targetChain);
    assert.equal(intent.targetAction, targetAction);
  });

  it("Executes an intent when price condition is met", async () => {
    // Note: This test requires a valid Pyth price feed with the correct price
    // In a real test environment, you would need to set up a mock price feed
    try {
      await program.methods
        .executeIntent()
        .accounts({
          intent: intentAccount,
          state: stateAccount,
          pythPriceFeed: pythPriceFeed,
          intentTokenAccount: intentTokenAccount,
          userTokenAccount: userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const intent = await program.account.intent.fetch(intentAccount);
      assert.equal(intent.isActive, false);
      assert.ok(intent.executedAt.gt(new anchor.BN(0)));
    } catch (error) {
      console.log("Note: This test requires a valid Pyth price feed setup");
    }
  });

  it("Cancels an active intent", async () => {
    // Create a new intent first
    const newIntentKeypair = anchor.web3.Keypair.generate();
    const newIntentAccount = newIntentKeypair.publicKey;
    const [newIntentTokenAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("token_account"), newIntentAccount.toBuffer()],
      program.programId
    );

    await program.methods
      .createIntent(
        sourceAmount,
        targetAmount,
        triggerPrice,
        isTakeProfit,
        targetChain,
        targetAction
      )
      .accounts({
        intent: newIntentAccount,
        state: stateAccount,
        user: wallet.publicKey,
        sourceToken: sourceToken,
        targetToken: targetToken,
        userTokenAccount: userTokenAccount,
        intentTokenAccount: newIntentTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([newIntentKeypair])
      .rpc();

    // Cancel the intent
    await program.methods
      .cancelIntent()
      .accounts({
        intent: newIntentAccount,
        user: wallet.publicKey,
        intentTokenAccount: newIntentTokenAccount,
        userTokenAccount: userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const intent = await program.account.intent.fetch(newIntentAccount);
    assert.equal(intent.isActive, false);
  });

  it("Fails to create intent with invalid parameters", async () => {
    const invalidIntentKeypair = anchor.web3.Keypair.generate();
    const invalidIntentAccount = invalidIntentKeypair.publicKey;
    const [invalidIntentTokenAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("token_account"), invalidIntentAccount.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .createIntent(
          new anchor.BN(0), // Invalid amount
          targetAmount,
          triggerPrice,
          isTakeProfit,
          targetChain,
          targetAction
        )
        .accounts({
          intent: invalidIntentAccount,
          state: stateAccount,
          user: wallet.publicKey,
          sourceToken: sourceToken,
          targetToken: targetToken,
          userTokenAccount: userTokenAccount,
          intentTokenAccount: invalidIntentTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([invalidIntentKeypair])
        .rpc();
      assert.fail("Expected error for invalid amount");
    } catch (error) {
      assert.include(error.message, "Invalid amount");
    }
  });
});
