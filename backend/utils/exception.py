"""Custom exception classes."""


class APIException(Exception):
    """Base API exception."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationException(APIException):
    """Validation error exception."""

    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class NotFoundException(APIException):
    """Resource not found exception."""

    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class ProcessingException(APIException):
    """Processing error exception."""

    def __init__(self, message: str):
        super().__init__(message, status_code=500)
