const getContract = name => artifacts.require(name)
const ETH = '0x0'

module.exports = {
  deployErc20Token: async (sender, finance, vault, name="ERC20Token", decimals=18) => {
    let token = await getContract('MiniMeToken').new("0x0", "0x0", 0, name, decimals, 'E20', true) // dummy parameters for minime
    let amount = new web3.BigNumber(10**9).times(new web3.BigNumber(10**decimals))
    let receiver = finance.address
    let initialSenderBalance = await token.balanceOf(sender)
    let initialVaultBalance = await token.balanceOf(vault.address)
    await token.generateTokens(sender, amount)
    await token.approve(receiver, amount, {from: sender})
    await finance.deposit(token.address, amount, "Initial deployment", {from: sender})
    assert.equal((await token.balanceOf(sender)).toString(), initialSenderBalance.toString())
    assert.equal((await token.balanceOf(vault.address)).toString(), (new web3.BigNumber(initialVaultBalance).plus(amount)).toString())
    return token
  },

  addAllowedTokens: async(payroll, tokens) => {
    const currencies = [ETH].concat(tokens.map(c => c.address))
    await Promise.all(currencies.map(token => payroll.addAllowedToken(token)))
  },

  getTimePassed: async (payroll, employeeId) => {
    let employee = await payroll.getEmployee.call(employeeId)
    let currentTime = await payroll.getTimestampPublic.call()
    return currentTime - employee[4]
  }
}