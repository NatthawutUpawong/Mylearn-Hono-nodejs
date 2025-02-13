import type { UserService } from "../../types/services/user.js"
import { Hono } from "hono"
import * as honoOpenapi from "hono-openapi"
import { resolver, validator } from "hono-openapi/effect"
import { deleteCookie, setCookie } from "hono/cookie"
import { Helpers, UserSchema } from "../../schema/index.js"
import { UserServiceContext } from "../../services/user/index.js"
import { Effect } from "effect"

const responseSchema = UserSchema.Schema.omit("deletedAt")

const loginDocs = honoOpenapi.describeRoute({
  responses: {
    200: {
      content: {
        "application/json": {
          schema: resolver(responseSchema),
        },
      },
      description: "Login User",
    },
  },
  tags: ["User"],
})

const logoutDocs = honoOpenapi.describeRoute({
  responses: {
    200: {
      content: {
        "application/json": {
        },
      },
      description: "Login User",
    },
  },
  tags: ["User"],
})

const validateLoginRequestBody = validator("json", UserSchema.LoginSchema)

export function setupUserLoginRoute() {
  const app = new Hono()

  app.post("/login", loginDocs, validateLoginRequestBody, async (c) => {
    const data = c.req.valid("json")
    const parseResponse = Helpers.fromObjectToSchemaEffect(responseSchema)

    const programs = UserServiceContext.pipe(
      Effect.tap(() => Effect.log("Login process start")),
      Effect.bind("user", (userServices) => 
        userServices.login())
    )

    // if (typeof userService.login !== "function") {
    //   return c.json({ message: "Internal Server Error: login function not found" }, 500)
    // }
    // const result = await userService.login(data.username, data)
    // if (result === null) {
    //   return c.json({ message: `not found user with username: ${data.username}` }, 404)
    // }
    // setCookie(c, "session", result.token, {
    //   httpOnly: true,
    //   maxAge: 3600,
    //   sameSite: "Strict",
    //   // eslint-disable-next-line node/prefer-global/process
    //   secure: process.env.NODE_ENV === "production",
    // })

    // return c.json({ result }, 200)
  })

  app.post("/logout", logoutDocs, async (c) => {
    deleteCookie(c, "session")
    return c.json({ message: "Logged out successfully" })
  })

  return app
}
