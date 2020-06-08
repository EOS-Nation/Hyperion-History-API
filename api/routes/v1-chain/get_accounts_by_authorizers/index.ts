import {FastifyInstance} from "fastify";
import {addChainApiRoute, getRouteName} from "../../../helpers/functions";

export default function (fastify: FastifyInstance, opts: any, next) {
    addChainApiRoute(
        fastify,
        getRouteName(__filename),
        'Returns an object containing various details about a specific account on the blockchain.',
        {
            "accounts": {
                "type": "array",
                "items": {
                    "anyOf": [
                        {
                            "ref": "AccountName#"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "actor": "AccountName#",
                                "permission": "AccountName#"
                            }
                        }
                    ]
                }
            }
        }
    );
    next();
}
