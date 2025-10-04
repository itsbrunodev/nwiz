import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AboutPage() {
  return (
    <div className="prose prose-p:!mt-0 prose-headings:!mb-3 prose-headings:not-first:!mt-6 prose-headings:!pb-3 prose-headings:!border-b dark:prose-invert prose-zinc !max-w-none">
      <Alert variant="warning">
        <AlertCircleIcon />
        <AlertTitle>Early Alpha Version</AlertTitle>
        <AlertDescription>
          This is a very early alpha version of the project. It is not fully
          featured and may contain bugs.
        </AlertDescription>
      </Alert>
      <h1>About</h1>
      <p>
        A simple, powerful tool for generating Cisco Packet Tracer network
        configurations.
      </p>
      <h2>The Problem</h2>
      <p>
        Configuring network devices like routers and switches using a Command
        Line Interface (CLI) is a fundamental skill in networking. However, the
        process can be tedious, repetitive, and highly susceptible to typos and
        syntax errors, especially when building complex labs for study or
        experimentation in tools like Cisco Packet Tracer. Remembering the exact
        sequence of commands for setting up VLANs, trunks, static routes, and IP
        addresses can be a significant hurdle.
      </p>
      <h2>The Solution</h2>
      <p>
        This tool provides a user-friendly web interface where you can visually
        and logically build your network topology. Add your devices, connect
        their interfaces, and configure their properties through simple forms.
        When you're done, the Wizard automatically translates your entire design
        into the precise, error-free Cisco IOS commands you need.
      </p>
      <h2>Features</h2>
      <ul>
        <li>Device command generation</li>
        <li>Auto static route calculation</li>
        <li>Simple device configuration</li>
        <li>Network tree view</li>
        <li>CIDR calculator</li>
        <li>
          <i>...and more to come</i>
        </li>
      </ul>
    </div>
  );
}
