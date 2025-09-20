const authenticationService = {
  authenticateUser: async (req, res) => {
    const { email, name, rollNo, accessCode, clientID, clientSecret } = req.body;

    const requiredParams = {
      email,
      name,
      rollNo,
      accessCode,
      clientID,
      clientSecret,
    };
    const missingParams = Object.entries(requiredParams)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingParams.length > 0) {
      await req.logger(
        "backend",
        "warn",
        "auth",
        `Login attempt failed: Missing parameters: ${missingParams.join(", ")}`
      );
      return res.status(400).json({
        error: "Missing required parameters",
        missingParams,
      });
    }

    try {
      await req.logger(
        "backend",
        "info",
        "auth",
        `Authentication attempt for user: ${email}, name: ${name}, rollNo: ${rollNo}`
      );

      const response = await fetch(
        "http://20.244.56.144/evaluation-service/auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
            rollNo,
            accessCode,
            clientID,
            clientSecret,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token_type === "Bearer") {
        await req.logger(
          "backend",
          "info",
          "auth",
          `Authentication successful for user: ${email}`
        );

        return res.status(200).json({
          success: true,
          message: "Authentication successful",
          data,
        });
      } else {
        await req.logger(
          "backend",
          "error",
          "auth",
          `Authentication failed for user: ${email}, status: ${response.status}`
        );

        return res.status(401).json({
          success: false,
          message: "Authentication failed: Invalid credentials",
          error: data.error || "Unknown error",
        });
      }
    } catch (error) {
      await req.logger(
        "backend",
        "error",
        "auth",
        `Authentication error: ${error.message}`
      );

      return res.status(500).json({
        success: false,
        message: "Authentication service unavailable",
        error: error.message,
      });
    }
  },

  validateInput: (data) => {
    const required = ['email', 'name', 'rollNo', 'accessCode', 'clientID', 'clientSecret'];
    return required.every(field => data[field]);
  },

  logMessage: async (logger, level, message) => {
    if (logger) {
      await logger("backend", level, "auth", message);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }
};

export default authenticationService;