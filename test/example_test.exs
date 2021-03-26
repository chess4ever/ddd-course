defmodule ReservationTest do
  use ExUnit.Case, async: false

  alias ReadModel.Screening, as: ScreeningReadModel

  setup do
    Movie.EventStore.reset()
  end

  test "customer reserves a free seat" do
    customer = Customer.new("foo")
    seats = [Seat.new("f", "4"), Seat.new("f", "5")]

    assert :ok =
             ReserveSeats.new(%{customer: customer, seats: seats})
             |> ReservationHandler.handle()

    assert [
             %SeatsReserved{
               seats: [
                 %Seat{column: "4", row: "f"},
                 %Seat{column: "5", row: "f"}
               ]
             }
           ] = Movie.EventStore.get()
  end

  test "customer tries to reserve a reserved seat" do
    customer = Customer.new("foo")
    seats = [Seat.new("f", "4"), Seat.new("f", "5")]
    # we should provide some test helper to do this kind of things
    # not rely on EventStore directly
    {:ok, _} = Movie.EventStore._store(SeatsReserved.new(%{customer: customer, seats: seats}))

    assert :error =
             ReserveSeats.new(%{customer: customer, seats: seats})
             |> ReservationHandler.handle()
  end

  test "customer can choose from a list of seats" do
    customer = Customer.new("foo")
    seats = [Seat.new("a", "2"), Seat.new("a", "3")]

    assert :ok =
             ReserveSeats.new(%{customer: customer, seats: seats})
             |> ReservationHandler.handle()

    assert [Seat.new("a", "1")] == ScreeningReadModel.available()
  end
end
