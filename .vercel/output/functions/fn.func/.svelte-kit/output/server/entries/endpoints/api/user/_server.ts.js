import { j as json } from "../../../../chunks/index.js";
import { _ as _data } from "../../../../chunks/index4.js";
const POST = async ({ request }) => {
  let { event, username } = await request.json();
  let id = 1337;
  for (let i = 1; i < _data.users.length + 3; i++) {
    if (!_data.users.find((u) => u.id === i)) {
      id = i;
      break;
    }
  }
  _data.users.unshift({
    id,
    name: username
  });
  return json({ id, username }, { status: 200 });
};
export {
  POST
};
