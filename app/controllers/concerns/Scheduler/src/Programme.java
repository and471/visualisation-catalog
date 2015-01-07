public class Programme implements Comparable<Programme> {

  private Visualisation vis;
  private int screens;
  private int priority;

//  public static final Programme[] defProgs = {
//    new Programme(Visualisation.defVis[0], 1),
//    new Programme(Visualisation.defVis[1], 2),
//    new Programme(Visualisation.defVis[2], 3)};

//  private Programme(Visualisation vis, int screens) { // for default programmes only
//    this.vis = vis;
//    this.screens = screens;
//    priority = 0;
//  }

  public Programme(Visualisation vis, int screens, int priority) {
    assert screens > 0: "Invalid nuumber of screens!";
    assert priority > 0: "Invalid priority!";
    this.vis = vis;
    this.screens = screens;
    this.priority = priority;
  }

  public Programme(Programme prog, int screens) {
    assert screens > 0: "Invalid nuumber of screens!";
    vis = prog.vis;
    this.screens = screens;
    priority = prog.priority;
  }
  
  public Visualisation getVis() {
    return vis;
  }
  
  public int getScreens() {
    return screens;
  }
  
  public float getPeriod() {
    return (float)vis.getDuration() / priority;
  }

  public int getDuration() {
    return vis.getDuration();
  }

  @Override
  public String toString() {
    return vis.toString() + ": " + screens + " screens";
  }

  @Override
  public int compareTo(Programme p) {
    int durationDiff = vis.getDuration() - p.vis.getDuration();
    return durationDiff == 0 ? (int)Math.signum(Math.random() * 2 - 1) : durationDiff;
  }

}
