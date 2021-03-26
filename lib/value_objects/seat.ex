defmodule Seat do
  @enforce_keys [:row, :column]
  defstruct [:row, :column]

  def new(row, column) do
    %__MODULE__{row: row, column: column}
  end
end
