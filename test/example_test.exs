defmodule ReservationTest do
  use ExUnit.Case

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

  # test "customer tries to reserve a reserved seat"
end
