const BASE = 'http://localhost:3002';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log(method, path, res.status, await res.json());
}

(async () => {
  await call('POST', '/students', { name: 'Ali', email: 'ali@example.com', className: 'BSCS-5A' });
  await call('GET', '/students');
  await call('PUT', '/students/1', { name: 'Ali Khan' });
  await call('GET', '/students/1');
  await call('DELETE', '/students/1');
  await call('GET', '/students/1');
})();
