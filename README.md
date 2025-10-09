> [!WARNING]
> This is a very early alpha version of the project. It is not fully featured and may contain bugs. Please report any issues to the [Issues](https://github.com/itsbrunodev/nwiz/issues) page.

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

## How to Use

Check out the [Wiki](https://github.com/itsbrunodev/nwiz/wiki/How-to-Use) to learn how to use nwiz.

## Examples

- [Static Routing](https://nwiz.itsbruno.dev/?network=N4IgdiBcIMoC4EM4EsDGACASgewK4rAHMQAaEZKEBAMwQUwHEBZAdwE4ARAN0wEEuAXgwCaqACwAOOJlIgAJlADaoCtACsAJyaFhEgOoAPZACMAWgDEAEqg7mAUrlMBpGHtkRoOfAFMNAJlkAC0omBGQwLzhfWThKGTIAW0o-NgBGVNlqKBVqAGclUA8QBmRCBGNkOABROEDfMG84AAYAegyybyg4DVxvMmQAB0o1JoA6MbH2kFyk6D81NXGlppAAXxJCyhKyiura%2BsbWlY6unr7yIegxCaWAshnkheXxtYBdMjkiwkrA3GNR1DYJJkAA2uAK5EoGgACrgBgBrABygUIYmM8I4AGZLAAZDgsACKgVSgXyZHB0AQcgS4Vklyo1Npq3eIBBXGyIHpCFyCjI1A0UCaZDg2CgqTU62muWCkFAXGikD8ZA08I5CWwCkgqSafjEkoQAsgmMluUNykhlPw2AAtBo8FFrZptLpDCYLNZbA5nK5rdrnsd5A1YtA-TcAw85k8w5kWBy4ABPSgNAxwSzYIZkBCUa7PDKrdYqSgIK22%2B3eR1aHT6IxmKw2eyOFx6a1%2BMMvD5B5Jt8OzEDzRbRvmx2UgBNJ7wptMZqjDNsBfMbC1UEt2nwV53Vt11z2Nn2Y7uyT6NSj7-2yCN9qPLGNxxPQZOp9OyLPqOdrZmSgbYXKVZDYDygAYUBiGomKjBIADsaipBBYhsGocGYn4qRkHeSGjAAbKkEhsE0agQRhmILGwsESgWS4aBwEi5BIvBhBIXAAFZqJgdgIMImLGEwACqACOWZkEUkS%2BAGMogMJArCnEsi9ik6SZByyB5BCRTbOUlQ1HUGhBkcsidJA3S9P09KhksUwXv2Z7kappTqXsWk6W0emnEZFxdrm56yVeExrIuNk7Bp%2BzaYcLR3CA%2BmGecgzZm25leQO17MvcZqFpaIqlmulHUbR9FMSxbEcVxfEII6B4dser5nvc8VVSA1DDqAY73hOj7Ti%2BfZvguqXLulq4OllNF0cgDHMax7GcTx-HWqeg6BhVIAzde1WPAlPlDre46Tk%2BmbuTc84fmQX4-ig-4ckBRrQaMEFIakGFwRImKYmIj2oWKagSKM8FNJBqRwRhEgLH4XVLmAdgYXAEHUBB3jCFwYAJDiGHYHYvFyNpcASO4cRlhoUxiRJMTSYkyRpFMWQjkp%2BSQOa-l2ZpBzNC0AYRWcxknrFnkrVZflbLZuz08FjNTCzrnRXMb7LZGq0vNZvMBfZDOtGFItRfSIzPGFFneTLLKmhCqg9TafXlqD4OQ9DsPw4jyOo%2BjEjWjms1HsGICO0t0w1bN9Ubc1W1tbtZnvouBvFr1ZbWqbENQzDcMI0jKNo2AGO%2BmVc0u6Za0e1zXsNaOd7gC1U7PgHkzvq8n7fr%2Bp0jud%2BGpOMTTwdBJEQd9r1anBox-Zi2HXHhEhA%2BRBvGAAwhowgDIEAgYfCyBONihEsAkfgEqYXDCFj0AwCwlSoIEomUNvu-BFJW8ySTGEBuTcpKCylO3xXx1-gBIDnXdfhd5IEgSGIfjzBBfgJAoRAGhDCGFRhqDSE0JovcYHfUHsHSgcg-CmGhAwPwmBTDCAwgkAYA8ABCcgxBVFQGoJw5hN6wB3nAPeeND7UL3oTM%2BxM5hsEvgpEc7JqZ32UtTTY0A1L8yCo5YWUBaAglyOcBImoqCoFQN4XIZIqBcNSAdTklcTov3OikMCMExBgMIhIJo%2BiwFqHbpiIxV0AYwUgVBNgmIIIQWBgbXITh8EADVkACFQNCXivAmDmCcPGQIxgwASBxGIbBlDoQjwPtAGJAYXbQg4SoEysUezZ3doQYcIAM6jDzIdDRz8zpQFgh9AGGFW7IWuBBCQhF274UWGwX%2B70-AALUP9fRziiyoAJBBTAuB4ymEIIibwI9UD4IJAMYQYhUAjyqEwaJI86HxOWUwkAyS%2BSKTSRrDJUtarZMoHkgp6in7V0AlAd6bBwLahwkhBY38mgQQafY0YDjrgAz8EhWpoFunQAgqYMAGFeIsERBwNQhB8G8HcYxAAKoiJwlgCTxicLEQSlAYlhTEpi9Zmy6rbPZrmPZl5pYBkOdARapdH5Vy0WKIiECdTQLgfotguoJANKeKkBxxj5jYVaU4oelAMLuMRAADQYOYXgOINDuN4hIXA1B6rmBxCwXioSlmYiCBikemrT4bJSW5Clc5iWWVmuShaHNqWaJKZAZ6H9vqtwsUAzEhFAGYgaWAhlrrCKOMIpAv5C0ECEAgnAXgCQJAEjgO4tQ3h4RwAEAMbg%2BCqimEoTAXw8oNBxNgBmkS6z3EGrFhaolJrtZkpyZS-JvlTk0ptYA%2BuIx5hNH%2Bi3O6v124YVbBAgi8EB5iC5f6pKIBUD6yFcEpwgRoTwiqBhKo7iWDcWhMIPwbE3G8DsJkQ0oA5AGydFWV0tYPQNm9G4fo5Nih80Cg5EKKxJQig5DuqEVFBq5VGgVCaxVZBKTlnTYRIV9qIOgLgEeah8E4hRfglgMbqAYXEDAAwbA9A92BHVLd8hd2VhdDWd09YvRNi-eewRV7FZOTvaKEcj77xgyjhbWO1sE52wIz%2BoR17GYAe6nI3AGFMAsBxLkHEP9UAJGoLwPQ0J4zGBxMuzdD6DYDRysNPKY1CqTQEuQQjl6FaC10mR2TSCUFoIwVgnBeC-CEOIaQ8hTGBGaYFiIoO3UNCuIGPBvQCRRV6GMIQBgLBUgMEsHAHEEEEAQRkxRuTz6FMjXyuNIq-FrMXvlnZkKJz73haTNR82Mcrbx1tknTGZ7mPEe06RwV0A2BcCxBBXi1BCDQmMAYMQTBhC8FwKgAQ3FKvxFQ3pqjZto6WzjjbROGMEtEa045W9wpyPbuHmPCeU8Z5zwXpiJeK814b0KzZpLf6hYOaXAkXgAxoRgCcAMAQwhMAaERBIeMYAILGDBnoPwjEwuzcoKPcek9p6z3npYRey9V7rwS%2BYbkE2UvVrS%2B96AriPFeJ8X4gJQSQlhIiVErbIBQe5HB80fbBsDAaEIKYfBDABAwFyKDiQ8JLCBHTLxAkvSN18jQ5RkAn2Fs-eW-91bgONsg7B8ltjkOZvoZ6X0gZQyRljImVMmZcyFn8%2Bx4L29ZXh2wssAIJrXANRyAGPGZAiI7CwtFfg5A%2BDCCLOZ71%2BQBn0GYOwbgghRCSFkIoRjrHOPWipZF6zgFQKQVgohVCmF8LEXItRYrz3eOjm8URId3A3Fx7cQECweM7jRUcA0LxOwYgcSWDe6L6AyDUF2%2BM47szzvLNu-U5QD3yvQrC%2Bt8KsVEqpUyrlQqpVKq1UQHdwL3bKvAO5OhCu-BsK2C5HjAgOw0IDASDwIEaCiJCCioL6z4vhn7cmadxZ13kf6%2Bat0%2BlilQaQ1hojVGmNcaE1JpTfvgfZcyCoHaq2eYKdrTGNhakPwRpUiKnAd9BhKmuSC-jqGoO-nhF-moJAHhDAQAf2sAfIAoiOtABwN4OqGANjhoEgOEIQOgLTiwOgGADvAIOgM-mAOgIQN4A0NgVEOgNjjgRgMbLkOgNQNgBoOgOEFEBoLQPIiwYCGAA0KgAQHgSKOgAgGANgEFEQY0CwOwfCKMGsEAA)

## Import from Packet Tracer

You can import a network you already built in Packet Tracer.

1. Download the Packet Tracer script module. You can get it [here](https://github.com/itsbrunodev/nwiz/raw/refs/heads/main/assets/nwiz.pts).
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
