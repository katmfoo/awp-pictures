@if ($email)
    Email '{{ $email }}' has been verified successfully
@else
    Verification code unknown
@endif