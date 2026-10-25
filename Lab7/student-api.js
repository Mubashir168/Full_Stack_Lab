const http = require('node:http');

const db = { students: [] };
const nextId = { students: 1 };

function reply(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

async function handleStudents(req, res, id) {
  const method = req.method;

  if (method === 'GET' && !id) return reply(res, 200, db.students);

  if (method === 'GET' && id) {
    const student = db.students.find((s) => s.id === Number(id));
    return student
      ? reply(res, 200, student)
      : reply(res, 404, { error: 'Student not found' });
  }

  if (method === 'POST' && !id) {
    const { name, email, className } = await readBody(req);
    if (!name || !email) {
      return reply(res, 400, { error: 'name and email are required' });
    }
    const student = { id: nextId.students++, name, email, className: className ?? null };
    db.students.push(student);
    return reply(res, 201, student);
  }

  if (method === 'PUT' && id) {
    const student = db.students.find((s) => s.id === Number(id));
    if (!student) return reply(res, 404, { error: 'Student not found' });
    const { name, email, className } = await readBody(req);
    if (name !== undefined) student.name = name;
    if (email !== undefined) student.email = email;
    if (className !== undefined) student.className = className;
    return reply(res, 200, student);
  }

  if (method === 'DELETE' && id) {
    const index = db.students.findIndex((s) => s.id === Number(id));
    if (index === -1) return reply(res, 404, { error: 'Student not found' });
    const [removed] = db.students.splice(index, 1);
    return reply(res, 200, { deleted: removed });
  }

  reply(res, 405, { error: 'Method not allowed' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const [resource, id] = url.pathname.split('/').filter(Boolean);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return reply(res, 200, { status: 'ok' });
    }
    if (resource === 'students') return await handleStudents(req, res, id);

    reply(res, 404, { error: 'Route not found' });
  } catch (err) {
    reply(res, 400, { error: err.message });
  }
});

server.listen(3002, () => console.log('Student API running on http://localhost:3002'));
