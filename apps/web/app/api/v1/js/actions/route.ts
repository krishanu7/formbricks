import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createAction } from "@formbricks/lib/action/service";
import { ZActionInput } from "@formbricks/types/v1/actions";
import { NextResponse } from "next/server";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const jsonInput = await req.json();

    // validate using zod
    const inputValidation = ZActionInput.safeParse(jsonInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const { environmentId, sessionId, name, properties } = inputValidation.data;

    // hotfix: don't create action for "Exit Intent (Desktop)", 50% Scroll events
    if (["Exit Intent (Desktop)", "50% Scroll"].includes(name)) {
      return responses.successResponse({}, true);
    }

    createAction({
      environmentId,
      sessionId,
      name,
      properties,
    });

    return responses.successResponse({}, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse(
      "Unable to complete response. See server logs for details.",
      true
    );
  }
}
