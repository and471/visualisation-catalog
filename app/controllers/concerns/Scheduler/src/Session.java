public class Session implements Comparable<Session> {

  private Visualisation vis;
  private int startTime;
  private int endTime;
  private int startScreen;
  private int endScreen;

  public Session(Programme prog, int startScreen, int startTime, int endTime) {
    vis = prog.getVis();
    this.startScreen = startScreen;
    endScreen = startScreen + prog.getScreens() - 1;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  public Visualisation getVis() {
    return vis;
  }

  public int getStartTime() {
    return startTime;
  }

  public int getEndTime() {
    return endTime;
  }

  public int getStartScreen() {
    return startScreen;
  }

  public int getEndScreen() {
    return endScreen;
  }

  @Override
  public String toString() {
    return vis.toString() + 
        ": time " + startTime + "-" + endTime +
        ", screen " + (startScreen + 1) + "-" + (endScreen + 1);
  }

  @Override
  public int compareTo(Session that) {
    if (startTime != that.startTime) {
      return startTime - that.startTime;
    } else {
      return startScreen - that.startScreen;
    }
  }

}
