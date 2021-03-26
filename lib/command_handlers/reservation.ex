defmodule ReservationHandler do
  def handle(%ReserveSeats{} = cmd) do
    screening =
      Movie.EventStore.get()
      |> Screening.new()

    Screening.execute(cmd, screening)
    |> Movie.EventStore.store()
    |> Projector.Screening.project()
  end
end
