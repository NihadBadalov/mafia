// import { usernameActions } from "$lib/firebase/database";
// import type { Handle, RequestEvent } from "@sveltejs/kit";
//
// const userUsernameAssignmentTimeout = new Set();
//
// export const handle: Handle = async ({ event, resolve }) => {
//   if (!userUsernameAssignmentTimeout.has(event.getClientAddress())) {
//     let username: string;
//     usernameActions.
//
//     userUsernameAssignmentTimeout.add(event.getClientAddress());
//     setTimeout(
//       () => userUsernameAssignmentTimeout.delete(event.getClientAddress()),
//       30_000
//     );
//   }
//
//   const response = await resolve(event! as unknown as RequestEvent);
//   return response;
// }
//
