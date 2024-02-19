/**
 * @name DMHistory
 * @description Allows you to see users that DMs have closed or users you've directly messaged
 * @author kaan
 * @version 1.0.4
 */

const { Patcher, Webpack, React } = BdApi;

class DMHistory {
  constructor() {
    this.Settings = BdApi.React.createContext();
    this.PrivateDMs = Webpack.getByKeys("openPrivateChannel");
    this.FriendRow = Webpack.getByStrings("isActiveRow:!1");
    this.PresenceStore = BdApi.Webpack.getStore("PresenceStore");
    this.UserStore = BdApi.Webpack.getStore("UserStore");
    this.ChannelStore = BdApi.Webpack.getStore("ChannelStore");
  }

  start() {
    this.Patch = Patcher.before(
      "IforgotANameIaHateBetterDiscord",
      this.PrivateDMs,
      "closePrivateChannel",
      (a, b) => {
        const ClosedChannel = b[0];
        const Channel = this.ChannelStore.getChannel(ClosedChannel);

        Channel.recipients.forEach( (userId) => {
            let Users = BdApi.Data.load("DMHistory", "ClosedUsers") || [];
            if (!Users?.includes(userId)) Users.push(userId);
            BdApi.Data.save("DMHistory", "ClosedUsers", Users);
        } )
      }
    );
  }

  stop() {
    this.Patch();
  }

  getSettingsPanel() {
    return React.createElement(
      this.Settings.Provider,
      { value: this },
      React.createElement(this.SettingsPanel.bind(this))
    );
  }

  SettingsPanel() {
    const Users = BdApi.Data.load("DMHistory", "ClosedUsers") || [];

    const UserRows = [];
    Users.forEach( (userId) => {
        if (userId) {
            UserRows.push(
              React.createElement(this.FriendRow, {
                user: this.UserStore.getUser(userId),
                activities: [],
                type: 1,
                status: this.PresenceStore.getStatus(userId),
              })
            );
          }
    })

    const maxPanelHeight = "300px";
    const panelStyle = {
      maxHeight: maxPanelHeight,
      overflowY: "auto",
    };

    return React.createElement("div", { style: panelStyle }, UserRows);
  }
}

module.exports = DMHistory;
