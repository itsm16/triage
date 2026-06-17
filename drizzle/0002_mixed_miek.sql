CREATE TABLE "triage_chat_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'INFO' NOT NULL,
	"operation" text DEFAULT 'system' NOT NULL,
	"time" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pg-drizzle_workflow_node" (
	"id" text PRIMARY KEY NOT NULL,
	"workflowId" text NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"positionX" double precision DEFAULT 0 NOT NULL,
	"positionY" double precision DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pg-drizzle_workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "pg-drizzle_workflow_node" ADD CONSTRAINT "pg-drizzle_workflow_node_workflowId_pg-drizzle_workflow_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."pg-drizzle_workflow"("id") ON DELETE cascade ON UPDATE no action;