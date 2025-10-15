> [!WARNING]
> This is an early beta version of the project. It is not fully featured and may contain bugs. Please submit any issues and/or suggestions to the [Issues](https://github.com/itsbrunodev/nwiz/issues) page.

# nwiz

A tool for generating Cisco IOS scripts from a network topology you build or import.

## About

nwiz creates Cisco IOS command scripts from a network topology. You can import existing networks from Packet Tracer or build your own.

The tool is accessible from [nwiz.itsbruno.dev](https://nwiz.itsbruno.dev/) or by downloading the standalone application from the [Releases](https://github.com/itsbrunodev/nwiz/releases) page.

## Core Features

- Build network topologies with routers, switches, and end devices.
- Generate complete Cisco IOS configurations from your topology.
- Import your existing Packet Tracer networks.
- Export your network as a shareable code.
- Visualize your network as an interactive graph or a text-based tree.
- Validate your configuration in real-time to find issues.
- Save and manage multiple network designs locally in your browser.

## Tech Stack

- **UI Library**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Jotai](https://jotai.org/)
- **Data Visualization**: [D3.js](https://d3js.org/)
- **Desktop App**: [Tauri](https://tauri.app/)
- **Local Storage**: [Dexie.js](https://dexie.org/)

## Roadmap to 1.0.0

Here's a look at what I'm working on to get nwiz ready for a stable 1.0.0 release.

- [x] **Command Highlighting**: Highlight parameters of commands in the UI.
- [x] **Custom Interfaces**: Ability to add custom interfaces to devices.
- [ ] **Dynamic Routing**: Support for OSPF to enable more complex network designs.
- [ ] **More Devices**: Layer 3 switches to allow for inter-VLAN routing.
- [ ] **Advanced Switching**: Configurations for VTP (VLAN Trunking Protocol) and EtherChannel.
- [ ] **Expanded Security**: Add options for DHCP Snooping and Port Security.
- [ ] **NAT (Network Address Translation)**: Support configuration for NAT, including defining inside/outside interfaces, address pools, and rules for translating private IPs to public ones.
- [ ] **ACL Configuration**: Interface for creating Access Control Lists (standard and extended) and applying them to router interfaces to filter traffic.
- [ ] **IPv6 Addressing**: Support for adding IPv6 addresses to device interfaces.

## How to Use

Check out the [Wiki](https://github.com/itsbrunodev/nwiz/wiki/How-to-Use) to learn how to use nwiz.

## Examples

- [Static Routing](https://nwiz.itsbruno.dev/?network=N4IgliBcINYMJwCwE0BGAnAtgcwIIHdUAmAEwDEAPAKwHUBVAewFMBjEAGhBKgG1QJoAOwCeACQCiAJRIUAzABkAnADM48gF4BWbOM0BpBhXwcQgqCEkMArgBcm6AAwmAFucu37TzjbcnM5okUARiCTZSh%2BZQBnXlAzaABxMGwAQ1QwG3EbZ3tBJhsHAHoiEyYoG3QrJk4wAAdzRAcAOmbm0M4o-2giTU0W-qcAX3Y48yTU9Mzs3Pyi9pAyyAqqmvru1v75zoDegZaQYdHE5LSMrJz0PILCrwXyyurwNZAgjbaTbe7dt4OAXQ70LFwOYUrYGABadDWOzgkQSaRyJSqDTaXQGIzgzRvfacEhXcxYva3T4gHp9H6cZTGSCgGzCcx5Cg2UQMeqcFINbElQaHYHQUE2CFQjywsRSGQKFRqLQ6fSGfDg2TY254-LmJVEj5dUnfAZham0%2BlCJhMllskAc9Z7bmDX7DEC1BhRDJgBjxUAUKCyADssiagR6RAAHMHgohvQ5vZwjURZIgmkFNIoiERXqnFIpNEFEDyRnyQAxEPgyCwGPhlCwAArKABCURS6AAUkwAHKSZSIbiceIWaH2eauaDuOzoeY%2BId%2BALBebhGngaJAnvjU5TC5XOale4rJ4BLlanbkvW8pcnSbnGbXEqcRbLR51Al7jrasma49jU9naaXWY3TdLB6rOq2JbM%2BuqtH8AJAgIFpgpCfbgoWxaluWVa1vWTatu2nbgo0mq4vi0C4RSIAki%2BxFUhEIB0gyJrMqyJiWiAhIbKEub8CCsHCjCiElmWFbVnWDbNm2HYkOCrx4VwBEvMq%2B5fIe4GUgaVFGqYtFmgxu57Kxtr2o6zo2K67ogJ6kBZt6TSyAAbJosiKN6jSIJoKaaNGUBEIgRCWQ5QYOEEQZBN69mRlZbH5qgZCYFYcBMAAykEMC1C2qApHU3pEKILBwAAGkGJg9sO9hXiAg69h46DFeOFiTt005hJRYALpAfCmO%2BEyfmuP63DeAE7oRj4kaBCn7G%2BxztauF4bteW53s8zGbHJOrDUM-wkYCzXsfynHwRFUUxfFiXJaltTpZlOVBuCRCyfhapWsRpFgTiIAUXO1HGqa9Hsg%2B1oHLy0ECkKO2RdFcUJUlKVpRlWW5eJ11SbdMmSQ9y36pRb1qR95qMURC1hf920irtIMHeDx2ndDF0asRqpVVTepPgekkvYaNGY5p0Dzc0Np2pw%2Bkum6lGmU5zTekGIZ%2BYo4ZOYoVmIG5kDZl5miIOGvkOPZPqS7IeMEiaysACIJEwJDOOI1gAIqKOg4jm5gZDegk%2BXmLF%2BAZCwzi3KVLtux7JhVbFNWkjLDiXYgAAqYf1XOABuvCrY1MTNTzDpOvzxmmb0VlNM5sai0GVlWZmQby3ZQQtMrHlBLLDippo3qhX95j1yQLbyEQ3pMKIACyNCKHAYeJqIgXoAAjpWTvQN7NjuwOzuu9Pzhjs7geBFZIceRHUegLHSc1E1PDJ3zhkC3OpmyCm2e%2BpGPnpVZvpRiARqyL5CbWXXfkOIgIR1zr0DR6g0cSDm2cAwMgshMAUBYFQZQmAWxd0EAALXQDoCeIBKxwE9uYdBtwqrj04NqdB4JKyR0pA1Z4EkWLEiGpJbA1JEYsQOLzVOx905ekQEGJoVkrohgCrZGuiArLy1shZLEHk4yyCxFw30v8QBWFkNlPQshKh1yDAANToMgruGiu61FELULuqD0Gz2gEYv2WDA6EOIVvPq9D%2BhXUWmRemIBaHmAobjJhBkjKC3crIMuAVYw118VZIM3pQmuUflALMrQUwRnYWIpMn8ZHelwLIfAUQR7SCIJIIgNgazZQoF3Ig2AayyHNsVHs6DiqlUqWYkxFi4BEJIc9MhQFtJUMZsRFx0A6bvD0swrxp8oACL9BI9hvQgzSwmQ4cJRpRGWULjXSMSp2FBDjDI6OogiCYDACwFsKQoGqBrClCgqibDZVqLgb0hi4CyBcFgm5tS0H1MadY%2B83SuTtPkjQuhPSEyMJTp4k%2BHpIl30stZX0st66aDFoIiJZkuH%2BiTJmZ%2BdcK5BBkZmCgehsDIHUHoZw6AkDqDAJoeQ4hYqqJSmUbszt7DR08HcyedKGXeHMKowOsVmXoBeaQucbyQC-NeJ8pa3zWkML6YC1hkAC4cNkHGRM3oQjBImYoeWiB7JNAETXK6Nkv4hR5KtNgG18xWQuQgsAZAWxWUECwFI5sSD60ECQeAMBVHoAMZSdaoASDQThOKREUoUSynRMYPebUVznm-NcVi3gGCUR9eYHiyF%2BJoSEphUSJhGrhrPF%2BdchQdJ5mgpgeQ%2BtUCKCYEQdAZBYrejoHoOA3oYAj00FEIgVkfCevjdBJNfFUKCQwiJTsmbZwgGXDmzql5-mCi7eYIm%2B0wZHUhmdXKw7s0dUmvm36hbzAnRbDWFIohZBWFECkVRVA6DZRHooeQFAyCqKIOoMIXquDQTnaDQ6EMTpQ3OqusaEbc1dSnXGucCahBigRJKZEMo0Tyl-aOj8E0o1FBtNuwiMBMA1jAGHKI2UdBEASAgqIogEEjyYIbWQjtO0gd9eBiUSJpSojlEYODY711Id-Paad1Gm5WRbm3Du3de790HsPMeLGEORrzQWzaBYgitjoEELuYdsqaGUN6VRggGAO2jvrWy5sn0zugM3Vu7dO49z7gPTQQ9vSjzwfOcwZAUhREQ1JoDhmQD-0AcA0B4DIHQNgfApBKCw3QEc85yTswt0yaILgGg%2BtKwXOQFZBB6gWznz0FEZAXcbAJBgAggz3GjO8ZMwJ8zwmrOibs1m0LTmXM-m5LG9zciFFKKsCo9RmjtG6P0XBsLdWChRfzEQEeqBcAwGQMgUQcBYpRASM4eQJBhCIkkKo1wVHvXdqLLxFCAl0LCSwl2ezf7x0bqGI1wrTE9aIENsbU2FsrY2ztg7cT40IvRsG9BNTghnCiEbHAaBNAwBBBYKIKIZAgx0BgObdAiACsbd1hQA2RsTZmysJba2tt7aUaOyAPrb3kNuYu8k1J6TMnZNyfkwpxTSnFWq7j2r%2BOPvmCiAg6FCQgh5BSC2WKlYWxMAYIEb0mhcBd2x8oZ9oHLuI%2Bu8ju7aOHuY%2BeyF%2Bn4WAPXFuZx4D8O-6bO2bs-Z0C4BHJSCcs5FyrnK7x2roYjdoBWHwBQMOygrKNlEBM9AQYUiCDoAkMg%2BsrCSHEFZOHL7zCYuxbi-FhLEDEtJeSylKRqU46txOs7VEteh45ldm7KP7sY6e9junKeN06UNYxK6PRYbiSCAPIgkAnKQAkU0RQIZ8ucCsOXmumgq8hFr-XoMkAa5NAckENvrVoC4DBJgFIhkWAAAJYo2Bnzsufw4wCCGwCYEgTAohGpAPrJgmA3TOfQMvjfc%2BQH4Dn4IV26g58A2n7PlIAAbZ-wg5-YCYHkU-dgohz%2Bc8vvPlxDvnPsoAwOgHPuviOMoPsiAaWIIHkCwIZOfoKPfppl%2BNfvkPgOATAE0AcEAA)

## Import from Packet Tracer

You can import a network you already built in Packet Tracer.

1. Download the Packet Tracer script module. You can get it [here](https://github.com/itsbrunodev/nwiz/raw/refs/heads/main/assets/script/nwiz.pts).
2. Open Packet Tracer. Go to **Extensions > Scripting > Configure PT Script Modules**. Click `Add` to import the `nwiz.pts` file.
3. Select the `nwiz` script module from the list. Click `Debug`.
4. A new window will open. If the console has text, click `Clear`. Click `Start`.
5. The script will print a JSON object. Select all the text in the console and copy it.

> [!NOTE]
> The script only generates a list of devices and their interface connections.

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

## License

nwiz is under the [GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/) license.
