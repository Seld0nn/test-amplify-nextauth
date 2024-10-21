export const amplifyConfig = {
    "Auth": {
        "Cognito": {
            "userPoolId": process.env.COGNITO_ADMIN_USER_POOL_ID ?? "",
            "userPoolClientId": process.env.COGNITO_CLIENT_ID ?? ""
        }
    }
};