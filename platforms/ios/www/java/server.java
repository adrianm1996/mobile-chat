
public class ServerExample extends HttpServlet {
	protected void doGet (HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String name = req.getParameter("userName");
		String email = req.getParameter("email");
		String ip = req.getRemoteAddr();

		resp.getWriter().println("<html>");
		resp.getWriter().println("<head>");
		resp.getWriter().println("<title> This is the response </title>");
		resp.getWriter().println("</head>");
		resp.getWriter().println("<body>");

		resp.getWriter().println("Your name is: " + name);
		resp.getWriter().println("<br>Your email is: " + email);
		resp.getWriter().println("<br>Your IP Address is: " + ip);

		resp.getWriter().println("</body>");
		resp.getWriter().println("</html>");
	
	}
}