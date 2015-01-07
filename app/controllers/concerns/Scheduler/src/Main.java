import java.util.ArrayList;
import java.util.Arrays;

public class Main {

  public static void main(String[] args) {
    int maxMins = 5, maxScreens = 8, maxPriority = 10;
    Visualisation[] vs = new Visualisation[maxMins + 1];
    for (int m = 1; m <= maxMins; m++) {
      vs[m] = new Visualisation(" V0" + m + " ", m);
    }
    Programme[][][] ps = new Programme[maxMins + 1][maxScreens + 1][maxPriority + 1];
    for (int mins = 1; mins <= maxMins; mins++) {
      for (int screen = 1; screen <= maxScreens; screen++) {
        for (int priority = 1; priority <= maxPriority; priority++) {
          Visualisation vis = new Visualisation(
              "M" + String.format("%02d", mins) + "," +
              "P" + String.format("%02d", priority), mins);
          ps[mins][screen][priority] = new Programme(vis, screen, priority);
        }
      }
    }

    Scheduler sc1xn = new Scheduler(1, 4, 15);
//    sc1xn.schedule(Arrays.asList(ps[1][2][1], ps[2][1][1], ps[1][1][2], ps[2][1][1], ps[1][2][1]));
//    sc1xn.schedule(Arrays.asList(ps[1][1][3], ps[2][2][5], ps[4][1][10], ps[3][1][7], ps[5][2][10]));
//    sc1xn.schedule(Arrays.asList(ps[1][3][3]));
//    sc1xn.schedule(Arrays.asList(ps[3][2][5]));
//    sc1xn.schedule(new ArrayList<Programme>());
    
//    Scheduler sc2x4 = new Scheduler(2, 4, 10);
//    sc2x4.schedule(Arrays.asList(ps[2][2][3], ps[1][1][2], ps[1][1][1]));
//    sc2x4.schedule(Arrays.asList(ps[1][1][1]));
//    sc2x4.schedule(Arrays.asList(ps[1][1][2], ps[2][8][4]));
//    sc2x4.schedule(new ArrayList<Programme>());
    
    Scheduler sc4x3 = new Scheduler(4, 3, 10);
    sc4x3.schedule(Arrays.asList(ps[3][6][8]));
  }

}
