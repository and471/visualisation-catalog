public class Visualisation {
  
  private String name;
  private int duration;
  
//  public static final Visualisation[] defVis = {
//    new Visualisation(" D01 "),
//    new Visualisation(" D02 "),
//    new Visualisation(" D03 ")};
  
//  private Visualisation(String name) { // for default visualisations only
//    this.name = name;
//    duration = 1;
//  }
  
  public Visualisation(String name, int duration) {
    this.name = name;
    assert duration > 0: "Invalid duration!";
    this.duration = duration;
  }
  
  public int getDuration() {
    return duration;
  }
  
  @Override
  public String toString() {
    return name;
  }
  
}
