const base = process.env.API_BASE ?? 'http://127.0.0.1:3001';

async function main() {
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'registrar@test.com', password: 'password123' }),
  });
  const loginJson = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, loginJson);
    process.exit(1);
  }
  const token = loginJson.token;
  console.log('Login OK, role:', loginJson.user?.role);

  const instRes = await fetch(`${base}/api/institutions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const instList = await instRes.json();
  if (!instRes.ok) {
    console.error('Institutions failed', instRes.status, instList);
    process.exit(1);
  }
  const institutionId = instList[0]?.id;
  if (!institutionId) {
    console.error('No institutions in DB');
    process.exit(1);
  }
  console.log('Institutions OK, using', institutionId);

  const studentBody = {
    role: 'student',
    name: 'API Test Student',
    phone: '+10000000001',
    institutionId,
    department: 'Computer Science',
    level: 'Year 2',
    tuitionFullyPaid: false,
  };
  const regRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(studentBody),
  });
  const regJson = await regRes.json();
  if (!regRes.ok) {
    console.error('Register student failed', regRes.status, regJson);
    process.exit(1);
  }
  console.log('Register student OK:', {
    email: regJson.email,
    hasPassword: Boolean(regJson.generatedPassword),
    tuitionPaid: regJson.tuitionPaid,
  });

  const login2 = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: regJson.email, password: regJson.generatedPassword }),
  });
  const login2Json = await login2.json();
  if (!login2.ok) {
    console.error('New user login failed', login2.status, login2Json);
    process.exit(1);
  }
  console.log('New student login OK');

  const staffBody = {
    role: 'staff',
    name: 'API Test Staff',
    phone: '+10000000002',
    institutionId,
    department: 'Engineering',
    courseTaught: 'ME101 Statics',
  };
  const staffRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffBody),
  });
  const staffJson = await staffRes.json();
  if (!staffRes.ok) {
    console.error('Register staff failed', staffRes.status, staffJson);
    process.exit(1);
  }
  console.log('Register staff OK:', {
    email: staffJson.email,
    courseTaught: staffJson.courseTaught,
  });

  console.log('All registrar registration checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
