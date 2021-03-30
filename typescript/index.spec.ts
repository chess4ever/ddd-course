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

  export const AvailableSeats = () => {
    let availableSeats: Set<Seat> = new Set();
    return {
      project(event: Events.Event) {
        switch (event.type) {
          case "ScreeningPlanned":
            availableSeats = new Set(event.allSeats);
            break;
          case "SeatsReserved":
            event.seats.forEach((seat) => availableSeats.delete(seat));
            break;
        }
      },
      availableSeats(query: ReturnType<typeof Queries.AvailableSeats>) {
        return {
          title: query.title,
          availableSeats: [...availableSeats],
        };
      },
    };
  };
}

namespace Events {
  export const ScreeningPlanned = (title: string, allSeats: Domain.Seat[]) =>
    ({
      title,
      allSeats,
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
namespace Queries {
  export const AvailableSeats = (title: string) =>
    ({
      title,
      type: "AvailableSeats",
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

        if (command.type === "ReserveSeat") {
          screening.reserveSeat(command);
        }
      },
    };
  };
  export const QueryHandler = (history: Events.Event[]) => {
    return {
      handleQuery(query: any) {
        const readModel = Domain.AvailableSeats();
        history.forEach((event) => readModel.project(event));

        if (query.type === "AvailableSeats") {
          return readModel.availableSeats(query);
        }
      },
    };
  };
}

namespace TestingFramework {
  export const createTest = () => {
    const generatedEvents: any[] = [];
    let history: any[] = [];
    let generatedResponse: any = null;

    return {
      given(...events: any[]) {
        history = events;
      },
      then(...expectedEvents: any[]) {
        expect(generatedEvents).toEqual(expectedEvents);
      },
      then_result(expectedResult: any) {
        expect(generatedResponse).toEqual(expectedResult);
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
      when_query(query: any) {
        generatedResponse = Infrastructure.QueryHandler(history).handleQuery(
          query
        );
      },
    };
  };
}

const allSeats = ["1a", "1b", "1c", "2a", "2b", "2c"];
it("Reserve Seat successfull test", () => {
  const { given, then, when } = TestingFramework.createTest();
  given(Events.ScreeningPlanned("Movie 42", allSeats));
  when(Commands.ReserveSeat("Movie 42", ["1b", "1c"]));
  then(Events.SeatsReserved("Movie 42", ["1b", "1c"]));
});
it("Reserve Seat failed test", () => {
  const { given, then, when } = TestingFramework.createTest();
  given(
    Events.ScreeningPlanned("Movie 42", allSeats),
    Events.SeatsReserved("Movie 42", ["1a", "1b"])
  );
  when(Commands.ReserveSeat("Movie 42", ["1b", "1c"]));
  then(Events.SeatsAlreadyReserved("Movie 42", ["1b"]));
});
// it("Reserve Seat failed test because reserving seat that does not exist", () => {
//   const { given, then, when } = TestingFramework.createTest();
//   given(Events.ScreeningPlanned("Movie 42", allSeats));
//   when(Commands.ReserveSeat("Movie 42", ["3b", "3c"]));
//   then(Events.SeatsNotExisting("Movie 42", ["3b", "3c"]));
// });

it("Projection: Available seats", () => {
  const { given, then_result, when_query } = TestingFramework.createTest();
  given(Events.ScreeningPlanned("Movie 42", allSeats));
  when_query(Queries.AvailableSeats("Movie 42"));
  then_result({
    availableSeats: allSeats,
    title: "Movie 42",
  });
});
it("Projection: Available seats after reservation", () => {
  const { given, then_result, when_query } = TestingFramework.createTest();
  given(
    Events.ScreeningPlanned("Movie 42", allSeats),
    Events.SeatsReserved("Movie 42", ["2a", "2b"])
  );
  when_query(Queries.AvailableSeats("Movie 42"));
  then_result({
    availableSeats: ["1a", "1b", "1c", "2c"],
    title: "Movie 42",
  });
});
