defmodule Projector.Screening do
  def project({:ok, %SeatsReserved{seats: seats}}), do: ReadModel.Screening.reserve(seats)
  def project({:error, reason}), do: {:error, reason}
  def project(:error), do: :error
end
