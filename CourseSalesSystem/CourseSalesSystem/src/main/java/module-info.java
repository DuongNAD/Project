module org.example.coursesalessystem {
    requires javafx.controls;
    requires javafx.fxml;


    opens org.example.coursesalessystem to javafx.fxml;
    exports org.example.coursesalessystem;
}