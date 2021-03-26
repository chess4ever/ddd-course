defmodule ReservationHandler do
  def handle(%ReserveSeats{} = cmd) do
    screening =
      Movie.EventStore.get()
      |> Screening.new()

    case Screening.execute(cmd, screening) do
      {:ok, e} ->
        Movie.EventStore.put(e)

      error ->
        error
    end
  end
end
