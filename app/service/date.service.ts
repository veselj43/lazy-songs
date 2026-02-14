const dateTimestampFromUnixTimestamp = (unixTime?: bigint) => {
  return unixTime ? +(unixTime * 1_000n).toString() : undefined
}

export const dateFromUnixTimestamp = (unixTime?: bigint) => {
  const timestamp = dateTimestampFromUnixTimestamp(unixTime)
  return timestamp ? new Date(timestamp) : undefined
}
