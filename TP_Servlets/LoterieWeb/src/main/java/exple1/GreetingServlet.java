package exple1;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

@SuppressWarnings("serial")
public class GreetingServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        String docType = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">\n";

        String votreNom = request.getParameter("nom");
        String nomPrenom = "Anonymous";

        if (votreNom != null)
            nomPrenom = votreNom.toUpperCase();

        String title = "<H1>Greetings " + nomPrenom + "!</H1>\n";

        out.println(docType +
                "<HTML>\n" +
                "<HEAD><TITLE>Greetings Servlet</TITLE></HEAD>\n" +
                "<BODY BGCOLOR=\"#FDF5E6\">\n" +
                title +
                "</BODY></HTML>");

        out.println("<br>Vous avez gagné: " + (Math.random() * 10) + " millions de dollars!");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
