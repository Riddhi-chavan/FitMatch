import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const key = Buffer.from(process.env.PROFILE_ENC_KEY!, 'base64'); // 32 bytes

export function encrypt(obj: unknown) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return {
    iv: iv.toString('base64'),
    tag: c.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  };
}

export function decrypt(p: { iv: string; tag: string; data: string }) {
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(p.iv, 'base64'));
  d.setAuthTag(Buffer.from(p.tag, 'base64'));
  return JSON.parse(
    Buffer.concat([d.update(Buffer.from(p.data, 'base64')), d.final()]).toString('utf8')
  );
}

