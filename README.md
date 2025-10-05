> [!WARNING] Early Alpha Version
> This is a very early alpha version of the project. It is not fully featured and may contain bugs.

# nwiz

A simple, powerful tool for generating Cisco Packet Tracer network configurations.

## About

nwiz creates Cisco IOS command scripts from a visual network topology. You can import existing networks from Packet Tracer or build your own.

## Core Features

- Build network topologies with routers, switches, and end devices.
- Generate complete Cisco IOS configurations from your topology.
- Import your existing Packet Tracer networks.
- Export your network as a shareable code.

## Import from Packet Tracer

You can import a network you already built in Packet Tracer.

1. Download the Packet Tracer script module. You can get it [here](https://github.com/itsbrunodev/nwiz/raw/refs/heads/main/assets/nwiz.pts).
2. Open Packet Tracer. Go to **Extensions > Scripting > Configure PT Script Modules**. Click `Add` to import the `nwiz.pts` file.
3. Select the `nwiz` script module from the list. Click `Debug`.
4. A new window will open. If the console has text, click `Clear`. Click `Start`.
5. The script will print a JSON object. Select all the text in the console and copy it.
6. Go to the nwiz website at [nwiz.itsbruno.dev](https://nwiz.itsbruno.dev/).
7. Click the `Import` button. Paste your copied text into the "Packet Tracer response" input.
8. Click `Import` to load your network.

## Run Locally

You can run the application on your own machine.

### Prerequisites

- Node.js
- Rust and Cargo

### Setup

Clone the project repository.

```sh
git clone https://github.com/itsbrunodev/nwiz.git
```

Navigate into the project directory.

```sh
cd nwiz
```

Install the required dependencies.

```sh
pnpm install
```

### Run the Development Server

Start the Vite development server.

```sh
pnpm dev
```

Alternatively, you can use the `pnpm tauri dev` command to build and run the application using Tauri.

## Build the Desktop App

You can build the application for your operating system.

Run the build command.

```sh
pnpm tauri build
```

The installer will be in the `src-tauri/target/release/bundle/` directory.
