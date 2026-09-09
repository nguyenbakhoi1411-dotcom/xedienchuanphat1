import java.sql.*;

public class TestDb {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:h2:mem:warrantydb", "SA", "");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT phone, full_name, role_id FROM users");
        while (rs.next()) {
            System.out.println(rs.getString("phone") + " - " + rs.getString("full_name") + " - Role: " + rs.getInt("role_id"));
        }
        
        ResultSet rs2 = stmt.executeQuery("SELECT r.id, r.name, p.name as perm FROM roles r JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON p.id = rp.permission_id");
        while (rs2.next()) {
            System.out.println("Role " + rs2.getString("name") + " has perm " + rs2.getString("perm"));
        }
        conn.close();
    }
}
