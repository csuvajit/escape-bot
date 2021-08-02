import { VercelRequest, VercelResponse } from '@vercel/node';
import nacl from 'tweetnacl';

const DISCORD_EPOCH = 1420070400000;

export default function (req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(404).json({ message: 'Method Not Allowed' });
    }

    const signature = req.headers['x-signature-ed25519'] as string;
    const timestamp = req.headers['x-signature-timestamp'] as string;

    const verified = nacl.sign.detached.verify(
        Buffer.from(`${timestamp}${JSON.stringify(req.body)}`),
        Buffer.from(signature, 'hex'),
        Buffer.from(process.env.PUBLIC_KEY!, 'hex')
    );
    if (!verified) {
        return res.status(401).end('{ message: }');
    }

    if (req.body.type === 1) return res.json({ type: 1 });

    const now = BigInt(Date.now());
    const bigIntId = BigInt(req.body.id);
    return res.status(200).json({
        type: 4,
        data: {
            content: `**Ping~ ${Number(now - (bigIntId >> 22n) - BigInt(DISCORD_EPOCH))}ms**`
        }
    });
}
