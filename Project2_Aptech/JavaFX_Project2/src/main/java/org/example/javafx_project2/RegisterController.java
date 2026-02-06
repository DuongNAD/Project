package org.example.javafx_project2;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.ImagePattern;
import javafx.scene.shape.Circle;
import javafx.stage.FileChooser;

import java.io.File;
import java.net.URL;
import java.util.ResourceBundle;

public class RegisterController implements Initializable {
    @FXML
    private Label appNameLabel;

    @FXML
    private Label emailLabel;
    @FXML
    private Label phoneLabel;

    @FXML
    private TextField fullNameTextField;
    @FXML
    private TextField userNameTextField;
    @FXML
    private TextField emailTextField;
    @FXML
    private TextField phoneTextField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private PasswordField confirmPasswordField;
    @FXML
    private Button registerButton;
    @FXML
    private Button backToLoginButton;

    @FXML
    private Circle avatarCircle;


    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        fullNameTextField.textProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue.trim().isEmpty()) {
                appNameLabel.setText("Nguyễn Văn A");
            }
            else {
                appNameLabel.setText(newValue.trim());
            }
        });
    }

    @FXML
    public void handleAvatarClick(MouseEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Chọn ảnh đại diện");
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Image Files",  "*.png", "*.jpg", "*.gif", "*.bmp")
        );
        File selectedFile = fileChooser.showOpenDialog(avatarCircle.getScene().getWindow());
        if (selectedFile != null) {
            Image newImage = new Image(selectedFile.toURI().toString());
            avatarCircle.setFill(new ImagePattern(newImage));
        }

    }

    @FXML
    public void onRegisterButtonClick() {
        String username = userNameTextField.getText();
        String email = emailTextField.getText();
        String phone = phoneTextField.getText();
        String password = passwordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        if(username.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            showAlert(Alert.AlertType.ERROR,"Lỗi nhập liệu","Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if(isValidEmail(email)) {
            showAlert(Alert.AlertType.ERROR,"Lỗi Email","Email không đúng định dạng (VD: abc@gmail.com)!");
            return;
        }

        if(password.equals(confirmPassword)) {
            System.out.println("Đăng ký thành công: " + username);
            showAlert(Alert.AlertType.INFORMATION,"Thành công", "Đăng ký tài khoản thành công!");
            clearFields();
        }
        else {
            showAlert(Alert.AlertType.ERROR, "Sai mật khẩu", "Mật khẩu nhập lại không khớp!");
            confirmPasswordField.clear();
        }
    }

    private void showAlert(Alert.AlertType alertType, String title, String message) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void clearFields() {
        userNameTextField.clear();
        emailTextField.clear();
        phoneTextField.clear();
        passwordField.clear();
        confirmPasswordField.clear();
        fullNameTextField.clear();
    }

    private boolean isValidEmail(String email) {
        String emailRegax= "^[a-zA-Z0-9_+&*-]+(?:\\\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegax);
    }
}
