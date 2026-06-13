import React from "react";

interface InviteEmailProps {
  title: string;
  start: string;
  end: string;
  body: string;
  to: string;
}

export function InviteEmail({ title, start, end, body, to }: InviteEmailProps) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return React.createElement(
    "div",
    {
      style: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "24px",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
            },
          },
          "\uD83D\uDCC5"
        ),
        React.createElement(
          "h2",
          {
            style: {
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            },
          },
          title
        ),
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: "0 0 4px 0",
            fontSize: "14px",
            color: "#6b7280",
          },
        },
        fmt(start),
        " \u2013 ",
        fmt(end)
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: "0 0 4px 0",
            fontSize: "14px",
            color: "#6b7280",
          },
        },
        "Organizer: you"
      ),
      React.createElement(
        "p",
        {
          style: {
            margin: 0,
            fontSize: "14px",
            color: "#6b7280",
          },
        },
        "Attendee: ",
        to
      ),
      body
        ? React.createElement(
            "div",
            {
              style: {
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              },
            },
            body
          )
        : null
    )
  );
}
