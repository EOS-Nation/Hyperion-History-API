const {getTokensSchema} = require("../../schemas");
const {getCacheByHash} = require("../../helpers/functions");
const route = '/get_tokens';

const fetch = require('node-fetch');
const {JsonRpc} = require('eosjs');
const eos_endpoint = process.env.NODEOS_HTTP;
const rpc = new JsonRpc(eos_endpoint, {fetch});

async function getTokens(fastify, request) {
    const t0 = Date.now();
    const {redis, elastic} = fastify;
    const [cachedResponse, hash] = await getCacheByHash(redis, route + JSON.stringify(request.query));

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = {
        query_time: null,
        'account': request.query.account,
        'tokens': []
    };

    const results = await elastic.search({
        "index": process.env.CHAIN + '-action-*',
        "body": {
            size: 0,
            query: {
                bool: {
                    // must_not: {term: {"act.account": "eosio.token"}},
                    filter: [
                        {term: {"notified": request.query.account}},
                        {terms: {"act.name": ["transfer", "issue"]}}
                    ]
                }
            },
            aggs: {
                tokens: {
                    terms: {
                        field: "act.account",
                        size: 1000
                    }
                }
            }
        }
    });

    for (const bucket of results['body']['aggregations']['tokens']['buckets']) {
        let token_data;
        try {
            token_data = await rpc.get_currency_balance(bucket['key'], request.query.account);
        } catch (e) {
            console.log(`get_currency_balance error - contract:${bucket['key']} - account:${request.query.account}`);
            continue;
        }
        for (const entry of token_data) {
            let precision = 0;
            const [amount, symbol] = entry.split(" ");
            const amount_arr = amount.split(".");
            if (amount_arr.length === 2) {
                precision = amount_arr[1].length;
            }
            response.tokens.push({
                symbol: symbol,
                precision: precision,
                amount: parseFloat(amount),
                contract: bucket['key']
            });
        }
    }
    response['query_time'] = Date.now() - t0;
    redis.set(hash, JSON.stringify(response), 'EX', 300);
    return response;
}

module.exports = function (fastify, opts, next) {
    fastify.get(route, {
        schema: getTokensSchema.GET
    }, async (request) => {
        return await getTokens(fastify, request);
    });
    next()
};
