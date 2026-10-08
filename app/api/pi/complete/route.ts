export const runtime = 'nodejs';

const PI_API_KEY = process.env.PI_API_KEY || 'gaftbllrx3j0zqi2a4s7rjr90m2ols1by3k0mzmozsrmsf3ot5sc8ngycezzfhel';

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid: txid ?? '' }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return Response.json(data, { status: res.status });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
