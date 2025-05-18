import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chain } = req.query;
  try {
    const { data } = await axios.get(`https://price-api.mayan.finance/v3/tokens?chain=${chain}`);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
} 