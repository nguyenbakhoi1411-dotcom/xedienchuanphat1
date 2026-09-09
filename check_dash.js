async function check() {
  try {
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'Admin@123', rememberMe: false })
    });
    const loginData = await loginRes.json();
    console.log('Login:', loginRes.status);
    if (!loginData.accessToken) {
        console.log("No token:", loginData);
        return;
    }
    
    const token = loginData.accessToken;
    
    const dashRes = await fetch('http://localhost:8080/api/dashboard?timeRange=THIS_YEAR', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard Data KPIs length:', dashData.kpis ? dashData.kpis.length : 0);
    console.log('Dashboard orders kpi:', dashData.kpis ? dashData.kpis.find(k => k.key === 'orders') : null);
    console.log('Dashboard revenue kpi:', dashData.kpis ? dashData.kpis.find(k => k.key === 'monthRevenue') : null);
    console.log('Dashboard topProducts length:', dashData.topProducts ? dashData.topProducts.length : 0);
  } catch (e) {
    console.error(e);
  }
}
check();
