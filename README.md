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

## Roadmap to 1.0.0

Here's a look at what I'm working on to get nwiz ready for a stable 1.0.0 release.

- **Dynamic Routing**: Support for OSPF to enable more complex network designs.
- **More Devices**: Layer 3 switches to allow for inter-VLAN routing.
- **Advanced Switching**: Configurations for VTP (VLAN Trunking Protocol) and EtherChannel.
- **Expanded Security**: Add options for DHCP Snooping and Port Security.
- **NAT (Network Address Translation)**: Support configuration for NAT, including defining inside/outside interfaces, address pools, and rules for translating private IPs to public ones.
- **ACL Configuration UI**: interface for creating Access Control Lists (standard and extended) and applying them to router interfaces to filter traffic.
- **IPv6 Addressing**: Support for adding IPv6 addresses to device interfaces.

## How to Use

Check out the [Wiki](https://github.com/itsbrunodev/nwiz/wiki/How-to-Use) to learn how to use nwiz.

## Examples

- [Static Routing](http://localhost:5173/?network=N4IgliBcINYMJwCwE0BGAnAtgcwIIHdUAmAEwDEAPAKwHUBVAewFMBjEAGhBKgG1QJoAOwCeACQCiAJRIUAzABkAnADM48gF4BWbOM0BpBhXwcQgqCEkMArgBcm6AAwmAFucu37TzjbcnM5okUARiCTZSh%2BZQBnXlAzaABxMGwAQ1QwG3EbZ3tBJhsHAHoiEyYoG3QrJk4wAAdzRAcAOmbm0M4o-2giTU0W-qcAX3Y48yTU9Mzs3Pyi9pAyyAqqmvru1v75zoDegZaQYdHE5LSMrJz0PILCrwXyyurwNZAgjbaTbe7dt4OAXQ70LFwOYUrYGABadDWOzgkQSaRyJSqDTaXQGIzgzRvfacEhXcxYva3T4gHp9H6cZTGSCgGzCcx5Cg2UQMeqcFINbElQaHYHQUE2CFQjywsRSGQKFRqLQ6fSGfDg2TY254-LmJVEj5dUnfAZham0%2BlCJhMllskAc9Z7bmDX7DEC1BhRDJgBjxUAUKCyIgADiamkQAHYiAA2WQ%2BhxKoKKRAhzhGoKExCIGOaEMOWOBn3Bog8kZ8kAMRD4MgsBj4ZQsAAKygAQlEUugAFJMABykmUiG4nHiFmh9nmrmg7js6HmPmHfgCwXm4Rp4GiQN741OUwuVzmpXuKyeAS5Wp25L1vOXJ0m5xm1xKnEWy0edQJ%2B462rJmpPYzPZ2ml1mNy3SweVZ1WxLYX11Vo-gBIEBAtMFIX7cEixLMsK2rOsG2bNsOy7cFGk1XF8WgPCKRAElXxIqkIhAOkGRNZlWRMS0QEJDZQjzfgQTg4UYSQ0ty0rGt60bFt207EhwVefCuEIl5lQPL4jwgykDWoo1TDos1GL3PY2Nte1HWdGxXXdEBPUgANAyaQMw0UWQQ0QNNEB9RRFHjKBEz9X0iFkRQQyIWM7JCQN2ILVAyEwKw4CYABlIIYFqVtUBSOpg1EFg4AADR9ExexHexrxAIc%2Bw8dAConCwp26GcwiosBF0gPhTA-CYv3XX9blvQDdyIp9SLAxT9nfY4WrXS9Nxvbd72eFjNnknUBqGf5SMBBqOP5LiELCiKoti%2BLEuS2pUvSrLwSIOSCLVK0SLI8CcRASj5xo41TQY9lH2tA5eRggUhU28LIpiuKEqSlKiDSzKfQk87pMu2SpJuhb9Sop71Je80mOI2aQu%2BjaRS2gHduBg6johxVodVcqNWu-qpIew1aLRrToBm5obTtTgDJdN0qLM5NEH9H17M0RRfWDWMMzcyBvSaEMfSCQNGgcBXNCzBxFGxgkTQDAARBImBIZxxGsABFRR0HEY3MDIQMEhy8xovwDIWGcW4iodp2XZMcrosq0lfIcU7EAAFSDmr5wAN14Ja6piBr2YdJ0uZMsz0xDJpk2c8MwxCENgkl2RA0UJp5aCH1NBCRpvSFjXoGskhW3kIhAyYUQAFkaEUOAg8TUR5fQABHKs7egd2bGdwd7cdsfnHHe3fcCdNA5DsPQEjuOanqnh485ozufnMyej9dNM0jKNFE0Ih89l9PbNkFWfKV14ghrkBw9QcOSGN5wGDIWRMAoFgVBlCYFbK3QQAAtdAOhh4gCrHAV25g4G3HKnA32cDwRVlDpSWqzxJKsWJDTEi2BqRw1YgcDmidd7Jy9JJEMgYHDOU0LIIIZ0y5BElsLfmuds6NDDEQIIIZNAvysLIDKehZCVBVj6AAanQKBrc5Gt1qKIWorcYFwIntADRXtEFwDQXADBWD7o4PMHg-oZ05rkT1JwYhpiQLkIToZYyPN3LlxlkGEugRmEqw4YGSyDh7Jy0UD6cMKtEC5i%2BuYQMuBZD4CiP3aQRBJBEBsLWDKFBW5EGwLWWQxsCq9jgQVIqhSdFaL0ZwbU6DMEr26iAKmmwCGHikrY6A9T3j6Uoc4-eUAQylyaBGII4TFD0MTHZSWvSi4LxYQ4cuDClQhhfuHUQRBMBgBYK2FIgDVC1iShQaRNgMq1FwIGdRcBZAuF0ec7wuj9GGJqQ%2BVpXJGkKWaSQtpxcHE7y6R6KA1l%2BaKAcEQQIQQC5N28q5EARpej8wYUrNWItBaCIifmGC58KB6GwMgdQehnDoCQOoMAmh5DiGitIpKZQez23sOHTwFyR7Utpdc%2Bl6AaWAgqVSll9g7nYPnA8upIEHDPPmq84COlPmdL3j8yAsY-SAsDHZOhvlEAgs0BwwRVk-J2VkEGUMmhBY8iWmwVaBYQxHPAWAMgrYQyCBYCkY2JBtaCBIPAGA0j0BqMpCtUAJAYJwnFIiKUKJZTomMBvZqq4Lw-muGxbwDAqI%2BvMLxFCAl0LCSwmJEwdVw3nm-BuQoukUXmEwPIbWqBFBMCIOgMg0VAx0D0HAQMMB%2B6aCiKGHwnr40wSTfxNCQlMKiS7JmucIAVw5raleBxgpO3mHxjtIG%2B1QbgyykO7NrUxr5s%2BoW6Ah1Wy1hSKIWQVhRApGkVQOgGV%2B6KHkBQMg0iiDqDCF6rgMFZ2Az2iDQ6YNjrZTDcNCNub2qTrjfOBNQgxQIklMiGUaJ5Qrr-WO9dNot0gEQDATAtYwBByiBlHQRAEjgKiKIcB-cmC61kLbDtIHfXgYlEiaUqI5RGDgyOz8o0o1FCGLG6dtcQz10bs3NuHcu49z7oPZjo613sY3S-BgQQ2x0CCK3IOGVNDKEDNIwQDAbbh21kw42j7uMgDrg3JuLd26d27poXugYB5D1-SAMgKQohsbzTG6iwHvUwTfh-L%2BP8-4AKASAsBkDoH2cc85yNG5N1rVJLgGg2sqxHOQCGcB6hWzej0FEZArcbAJBgOAgzVGom8ZMwJ8zwmrOibswucw4WXO-m5Fxor0ARFiIkVYKRsj5GKOUao5jdXIuzGiwWIg-dUC4BgMgZAog4DRSiAkZw8gSDCERJIaRrhKOecTcWPiqFBIYREthbsNX4OSbzZx9zhnNBa0QLrfWhsTZmwtlbG24nWODejcNmCanBDOFEE2OAQCaBgCCCwUQUQyA%2BjoDAY26BECFa28zG7d2DZGysKbc2ltrYUZOw5pz9WJ32inc1ozMS4kJJIEklJaSMlZJyXk-r%2BOPtDEidAKI4C9UJCCHkFIrZopVlbEwBggRAyaFwK3HHygn2geYsjvWqPHuY5ezjrN0ABsAeuOconHnn3mCWSstZGytlwB2SkPZByjknLC0zjXLPkNWHwBQIOygQxNlED6RA6AfQpEEHQBIZBtZWEkOIEMCPdfQDRRirFOK8WIAJUSklZKUgUtx%2Br8dF3ieI9lxQHW8uHvo6e1j171uIu2%2Bk7aTgtq9w9ChhJII3ciDSs0FLPowSiAFc4FYJiZ0a%2BvDrw36VPpICAqssqjvTVoC4DBJgFIRkWAAAJoo2Fn2s%2BfI4wCCGwCYEgTAohGpANrJgmA3TOfQCvzf8-v74Hn4IR26h58-Rn3PlIAAbF-wh5-YCYHkM-dgojz%2BcxXwX24l33n2UAYHQHnw31HGUE2VALLEEDyBYCMgv0FAf002-Bv3yHwAgJgCaAOCAA)

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
