<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Account Information</title>
</head>

<body>
    <h2>Account Information</h2>
    <p>Hello, {{ $account }}</p>

    @if ($status == 0)
        <h3 style="color: red;">Your account with email {{ $email }} has been locked. Please contact the
            administrator!</h3>
    @else
        <h3 style="color: green;">Your account with email {{ $email }} has been unlocked!</h3>
    @endif
</body>

</html>
