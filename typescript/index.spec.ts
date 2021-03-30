// Scenario: Online Reservation
// The system lists movies available with given time interval, title and screening times and prices.
// The user chooses a particular screening.
// The system gives information regarding screening room and available seats.
// The user chooses seats, and gives the name of the person doing the reservation (name and surname).
// The system gives back the total amount to pay and reservation expiration time.
// After 12 minutes, the reservatrion should be cancelled

namespace Domain {
  export type Seat = string;
  export const Screening = (publish: Infrastructure.Publish) => {
    let reservedSeats = new Set();

    return {
      apply(event: Events.Event) {
        switch (event.type) {
          case "ScreeningPlanned":
            reservedSeats = new Set();
            break;
          case "SeatsReserved":
            event.seats.forEach((seat) => reservedSeats.add(seat));
        }
      },

      reserveSeat(command: ReturnType<typeof Commands.ReserveSeat>) {
        const alreadyReservedSeats = command.seats.filter((seat) =>
          reservedSeats.has(seat)
        );
        if (alreadyReservedSeats.length > 0) {
          publish(
            Events.SeatsAlreadyReserved(command.title, alreadyReservedSeats)
          );
        } else {
          publish(Events.SeatsReserved(command.title, command.seats));
        }
      },
    };
  };
}

namespace Events {
  export const ScreeningPlanned = (title: string) =>
    ({
      title,
      type: "ScreeningPlanned",
    } as const);
  export const SeatsReserved = (title: string, seats: Domain.Seat[]) =>
    ({
      seats,
      title,
      type: "SeatsReserved",
    } as const);
  export const SeatsAlreadyReserved = (
    title: string,
    alreadyReservedSeats: Domain.Seat[]
  ) =>
    ({
      alreadyReservedSeats,
      title,
      type: "SeatsAlreadyReserved",
    } as const);

  export type Event =
    | ReturnType<typeof ScreeningPlanned>
    | ReturnType<typeof SeatsReserved>
    | ReturnType<typeof SeatsAlreadyReserved>;
}
namespace Commands {
  export const ReserveSeat = (title: string, seats: Domain.Seat[]) =>
    ({
      seats,
      title,
      type: "ReserveSeat",
    } as const);
}
namespace Infrastructure {
  export const unreachable = (_value: never) => {
    throw new Error("should be unreachable");
  };
  export type Publish = (event: Events.Event) => void;
  export const CommandHandler = (history: any[], publish: Publish) => {
    return {
      handleCommand(command: any) {
        const screening = Domain.Screening(publish);
        history.forEach((event) => screening.apply(event));

        screening.reserveSeat(command);
      },
    };
  };
}

namespace TestingFramework {
  export const createTest = () => {
    const generatedEvents: any[] = [];
    let history: any[] = [];

    return {
      given(...events: any[]) {
        history = events;
      },
      then(...expectedEvents: any[]) {
        expect(generatedEvents).toEqual(expectedEvents);
      },
      when(command: any) {
        const commandHandler = Infrastructure.CommandHandler(
          history,
          (event) => {
            generatedEvents.push(event);
          }
        );
        commandHandler.handleCommand(command);
      },
    };
  };
}

it("Reserve Seat successfull test", () => {
  const { given, then, when } = TestingFramework.createTest();
  given(Events.ScreeningPlanned("Movie 42"));
  when(Commands.ReserveSeat("Movie 42", ["4f", "4g"]));
  then(Events.SeatsReserved("Movie 42", ["4f", "4g"]));
});
it("Reserve Seat failed test", () => {
  const { given, then, when } = TestingFramework.createTest();
  given(
    Events.ScreeningPlanned("Movie 42"),
    Events.SeatsReserved("Movie 42", ["4e", "4f"])
  );
  when(Commands.ReserveSeat("Movie 42", ["4f", "4g"]));
  then(Events.SeatsAlreadyReserved("Movie 42", ["4f"]));
});
