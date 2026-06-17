async function test() {
    try {
        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'resident', password: 'resident123' })
        });
        if (!loginRes.ok) throw new Error("Login failed with status " + loginRes.status);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in, token:", token);

        const aptsRes = await fetch('http://localhost:8080/api/apartments', { headers: { 'Authorization': `Bearer ${token}` }});
        const apts = await aptsRes.json();
        const aptId = apts[0].id;

        const feesRes = await fetch(`http://localhost:8080/api/fees/apartment/${aptId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        const fees = await feesRes.json();
        const feeId = fees[0].id;
        
        const req = {
            amount: fees[0].amount,
            method: 'QR',
            note: 'Đã thanh toán qua QR'
        };
        
        const payRes = await fetch(`http://localhost:8080/api/api/payments/fee/${feeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(req)
        });
        
        if (!payRes.ok) {
            const errText = await payRes.text();
            console.error("Payment failed:", payRes.status, errText);
        } else {
            const payData = await payRes.json();
            console.log("Payment created:", payData);
        }

    } catch (e) {
        console.error("Test failed:", e.message);
    }
}
test();
