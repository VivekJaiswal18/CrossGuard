export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "UTC",
    }
    return date.toLocaleDateString("en-US", options)
  }