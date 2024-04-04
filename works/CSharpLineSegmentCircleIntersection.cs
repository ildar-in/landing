
public class MathIntersections
{
    public static List<Vector3> InteceptCircleLineSeg(Vector3 center, float radius, Vector3 p1, Vector3 p2)
    {
        var v1 =new Vector3();
        var v2 = new Vector3();
        v1.x = p2.x - p1.x;
        v1.y = p2.y - p1.y;
        v2.x = p1.x - center.x;
        v2.y = p1.y - center.y;
        var b = (v1.x * v2.x + v1.y * v2.y);
        var c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        var d = Math.Sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - radius * radius));
        if (double.IsNaN(d))
        { // no intercept
            return new List<Vector3>();
        }
        var u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
        var u2 = (b + d) / c;
        var retP1 = new Vector3();   // return points
        var retP2 = new Vector3();
        var ret = new List<Vector3>(); // return array
        if (u1 <= 1 && u1 >= 0)
        {  // add point if on the line segment
            retP1.x = (float)(p1.x + v1.x * u1);
            retP1.y = (float)(p1.y + v1.y * u1);
            //ret[0] = retP1;
            ret.Add(retP1);
        }
        if (u2 <= 1 && u2 >= 0)
        {  // second add point if on the line segment
            retP2.x = (float)(p1.x + v1.x * u2);
            retP2.y = (float)(p1.y + v1.y * u2);
            ret.Add(retP2);
            //ret[ret.length] = retP2;
        }
        return ret;
    }
}
