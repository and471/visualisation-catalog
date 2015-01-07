json.array!(@timeslots) do |timeslot|
   json.extract! timeslot, :start_time, :end_time, :start_screen, :end_screen, :visualisation_id
end
