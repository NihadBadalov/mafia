import { error, json, type RequestHandler } from '@sveltejs/kit'
import { _data } from '../index';

export const POST: RequestHandler = async ({ request }) => {
  let { origin, username, bot } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  let id = 1337;
  for (let i = 1; i < _data.users.length + 3; i++) {
    if (!_data.users.find(u => u.id === i)) {
      id = i; break;
    }
  }

  _data.users.unshift({
    id: id,
    name: bot
      ? `${id} - ${username}`
      : username,
  });

  return json({ id, username }, { status: 200 });
}

export const DELETE: RequestHandler = async ({ request }) => {
  let { origin, userId } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (_data.users.find(u => u.id === userId))
    throw error(404, 'User not found');

  _data.users.splice(_data.users.findIndex(u => u.id === userId), 1);

  return json({ success: true }, { status: 200 });
}

