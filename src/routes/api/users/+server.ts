import { json, type RequestHandler } from '@sveltejs/kit'
import { _data } from '../index';

export const GET: RequestHandler = async (event) => {
  return json({ ..._data, endpoint: event?.url?.href });
}

export const POST: RequestHandler = async ({ request }) => {
  let { event, username } = await request.json();

  let id = 1337;
  for (let i = 1; i < _data.users.length + 3; i++) {
    if (!_data.users.find(u => u.id === i)) {
      id = i; break;
    }
  }

  _data.users.unshift({
    id: id,
    name: username,
  });

  return json({ id, username }, { status: 200 });
}

