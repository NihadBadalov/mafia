import { fail, redirect, type Actions } from '@sveltejs/kit';
import { handleUserSession } from '$lib';
import type { PageServerLoad } from '../$types.js';

export const load: PageServerLoad = (async ({ cookies, fetch, url }) => {
    await handleUserSession(cookies, fetch, url?.href);
    return {};
});

export const actions = {
    default: async ({ request, fetch }) => {
        const data = await request.formData();
        const serverName = data.get('serverName') || '';
        let maxPlayerAmount = data.get('maxPlayerAmount') as unknown as number;
        let amountOfMafia = data.get('amountOfMafia') as unknown as number;

        if (!serverName) return fail(400, { serverName, missing: true });
        if (serverName.length < 3) return fail(400, { serverName, incorrect: true });

        if (!maxPlayerAmount) return fail(400, { maxPlayerAmount, missing: true });
        if (isNaN(maxPlayerAmount)) return fail(422, { maxPlayerAmount, incorrect: true });
        maxPlayerAmount = +maxPlayerAmount;
        if (maxPlayerAmount < 6 || maxPlayerAmount > 16) return fail(400, { maxPlayerAmount, incorrect: true });

        if (!amountOfMafia) return fail(400, { amountOfMafia, missing: true });
        if (isNaN(amountOfMafia)) return fail(422, { amountOfMafia, incorrect: true });
        amountOfMafia = +amountOfMafia;
        if (amountOfMafia < Math.floor(maxPlayerAmount / 4) - 1 || amountOfMafia > Math.ceil(maxPlayerAmount / 3))
            return fail(400, { amountOfMafia, incorrect: true });

        const response = await fetch('/api/servers', {
            method: 'POST',
            body: JSON.stringify({
                serverName,
                maxPlayerAmount,
                amountOfMafia,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseJson = await response.json();

        if (responseJson?.success === true) {
            throw redirect(303, `/game/${responseJson.serverId}`);
        }
        else {
            return fail(500, { serverError: true });
        }
    },
} satisfies Actions;
